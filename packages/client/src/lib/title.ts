import { APP_NAME } from '@zapbots/finance';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Each screen's name for the browser tab, the most specific path first. */
const TITLES: [RegExp, string][] = [
  [/^\/$/, 'Página inicial'],
  [/^\/chat/, 'Agente'],
  [/^\/documents\/.+/, 'Documento'],
  [/^\/documents/, 'Documentos'],
  [/^\/integrations/, 'Integrações'],
  [/^\/organization/, 'Organização'],
  [/^\/plan/, 'Plano'],
  [/^\/settings/, 'Configurações'],
  [/^\/personal\/calendar\/booking/, 'Links de agendamento'],
  [/^\/personal\/calendar/, 'Agenda'],
  [/^\/personal\/tasks/, 'Tarefas'],
  [/^\/personal\/notes/, 'Notas'],
  [/^\/personal\/goals/, 'Metas'],
  [/^\/fitness\/workouts/, 'Fichas de treino'],
  [/^\/fitness\/diet/, 'Dieta'],
  [/^\/fitness\/macros/, 'Macros'],
  [/^\/fitness\/sleep/, 'Sono'],
  [/^\/fitness\/measures/, 'Medidas'],
  [/^\/profile/, 'Perfil'],
  [/^\/workflows/, 'Workflows'],
  [/^\/caishen\/entries/, 'Fluxo de caixa'],
  [/^\/caishen\/income/, 'Entradas'],
  [/^\/caishen\/fixed/, 'Gastos'],
  [/^\/caishen\/budget/, 'Orçamento'],
  [/^\/caishen\/payoff/, 'Sair das dívidas'],
  [/^\/caishen\/calculators/, 'Calculadoras'],
  [/^\/caishen\/credit/, 'Score de crédito'],
  [/^\/caishen\/operations/, 'Operação de crédito'],
  [/^\/sign-in/, 'Entrar'],
  [/^\/terms/, 'Termos de Uso'],
  [/^\/privacy/, 'Política de Privacidade'],
  [/^\/landing/, 'Finanças organizadas, sem planilha'],
];

/** The screen's name for a path, if it has one. */
export const pageTitle = (path: string) => TITLES.find(([pattern]) => pattern.test(path))?.[1];

/** Names the browser tab after the screen open, as "Lançamentos · Caishen". */
export function useDocumentTitle(inApp: boolean) {
  const { pathname } = useLocation();
  useEffect(() => {
    // Outside the app, `/` is the landing page.
    const path = !inApp && pathname === '/' ? '/landing' : pathname;
    const name = pageTitle(path);
    document.title = name ? `${name} · ${APP_NAME}` : APP_NAME;
  }, [pathname, inApp]);
}
