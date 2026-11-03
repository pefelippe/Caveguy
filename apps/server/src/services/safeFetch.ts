import { lookup, type LookupAddress } from 'node:dns';
import { BlockList, isIP } from 'node:net';

import { Agent } from 'undici';

/**
 * Addresses no link a User pastes may reach: this machine, the private networks, the cloud's
 * metadata service and the like. Checked on the address actually connected to, after DNS, so a
 * name that points inside is refused too.
 */
const INSIDE = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 3],
] as const) {
  INSIDE.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
  ['::', 127],
  ['::ffff:0:0', 96],
  ['64:ff9b::', 96],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  INSIDE.addSubnet(network, prefix, 'ipv6');
}

export const isPublicAddress = (address: string) => {
  const family = isIP(address);
  if (!family) return false;
  // An IPv4 address written as IPv6 is judged as IPv4.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address)?.[1];
  if (mapped) return !INSIDE.check(mapped, 'ipv4');
  return !INSIDE.check(address, family === 4 ? 'ipv4' : 'ipv6');
};

/** A connection that only opens to public addresses. */
const outside = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      lookup(hostname, { ...options, all: true }, (error, addresses: LookupAddress[]) => {
        if (error) return callback(error, addresses);
        const allowed = addresses.filter(({ address }) => isPublicAddress(address));
        if (!allowed.length) {
          return callback(Object.assign(new Error('Endereço interno'), { code: 'EINSIDE' }), []);
        }
        // `net` asks for one address or for all of them, depending on how it connects.
        if (options.all) return callback(null, allowed);
        return (callback as (error: null, address: string, family: number) => void)(
          null,
          allowed[0]!.address,
          allowed[0]!.family
        );
      });
    },
  },
});

export class FetchRefused extends Error {}

/** Hops a link may redirect through (iCloud moves between its own servers). */
const MAX_REDIRECTS = 3;

/** Refuses what no link may reach: not https, or an address written out that is not public. */
function checkTarget(url: URL) {
  if (url.protocol !== 'https:') throw new FetchRefused('O link precisa começar com https://.');
  // Node does not look an address up when it is written out, so the agent above never sees it.
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host) && !isPublicAddress(host)) {
    throw new FetchRefused('Esse endereço não é público.');
  }
}

/** The body as text, refused once it passes `maxBytes`, without holding more than that. */
async function readCapped(response: Response, maxBytes: number): Promise<string> {
  if (Number(response.headers.get('content-length') ?? 0) > maxBytes) {
    throw new FetchRefused('O arquivo do link é grande demais.');
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of response.body ?? []) {
    size += chunk.byteLength;
    if (size > maxBytes) {
      await response.body?.cancel().catch(() => {});
      throw new FetchRefused('O arquivo do link é grande demais.');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * GETs a link a User gave: https only, public addresses only (each redirect checked again), at
 * most `maxBytes`, 15 seconds. Throws `FetchRefused` with a message for people.
 */
export async function fetchOutside(
  url: URL,
  { accept, maxBytes }: { accept: string; maxBytes: number }
): Promise<string> {
  const signal = AbortSignal.timeout(15_000);
  let target = url;
  let response: Response;
  for (let hop = 0; ; hop += 1) {
    checkTarget(target);
    try {
      response = await fetch(target, {
        // @ts-expect-error: Node's fetch takes undici's dispatcher, which the DOM types do not know.
        dispatcher: outside,
        headers: { Accept: accept, 'User-Agent': 'Caishen/1.0 (+https://caishen.app)' },
        redirect: 'manual',
        signal,
      });
    } catch {
      throw new FetchRefused('Não consegui abrir o link. Confira se ele está certo e é público.');
    }
    const location = response.headers.get('location');
    if (response.status < 300 || response.status >= 400 || !location) break;
    await response.body?.cancel().catch(() => {});
    if (hop >= MAX_REDIRECTS) throw new FetchRefused('O link redireciona demais.');
    try {
      target = new URL(location, target);
    } catch {
      throw new FetchRefused('O link redireciona para um endereço inválido.');
    }
  }
  if (response.status === 404 || response.status === 410) {
    throw new FetchRefused('O link não existe mais.');
  }
  if (response.status === 401 || response.status === 403) {
    throw new FetchRefused('O link pede senha ou não é público.');
  }
  if (!response.ok)
    throw new FetchRefused(`O servidor do link respondeu com erro (${response.status}).`);
  try {
    return await readCapped(response, maxBytes);
  } catch (error) {
    if (error instanceof FetchRefused) throw error;
    throw new FetchRefused('Não consegui abrir o link. Confira se ele está certo e é público.');
  }
}
