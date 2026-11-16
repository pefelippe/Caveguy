import { useMutation } from '@apollo/client/react';
import { ContactTeamDocument, type ContactKind } from '@zapbots/graphql/client';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Button } from '@zapbots/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zapbots/ui/components/dialog';
import { Label } from '@zapbots/ui/components/label';
import { Textarea } from '@zapbots/ui/components/textarea';

import { useI18n } from '../lib/i18n';
import { FormError } from './FormError';
import { useToast } from './Toaster';

const MAX = 4000;

/**
 * Suporte and Enviar feedback, written inside the app: the message goes to the team by e-mail
 * (`contactTeam`) with who sent it and the screen it came from, and the answer comes by e-mail.
 */
export function ContactDialog({ kind, onClose }: { kind: ContactKind; onClose: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const { pathname } = useLocation();
  const [message, setMessage] = useState('');
  const [send, { error, loading }] = useMutation(ContactTeamDocument);
  const support = kind === 'SUPPORT';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await send({ variables: { kind, message, page: pathname } }).catch(() => null);
    if (!result?.data?.contactTeam) return;
    toast({ message: t('contact.sent') });
    onClose();
  };

  return (
    <Dialog onOpenChange={open => !open && onClose()} open>
      <DialogContent className="sm:max-w-lg">
        <form className="flex flex-col gap-4" onSubmit={event => void submit(event)}>
          <DialogHeader>
            <DialogTitle>{t(support ? 'nav.support' : 'nav.feedback')}</DialogTitle>
            <DialogDescription>
              {t(support ? 'contact.supportHint' : 'contact.feedbackHint')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-message">{t('contact.message')}</Label>
            <Textarea
              autoFocus
              className="min-h-36"
              id="contact-message"
              maxLength={MAX}
              onChange={event => setMessage(event.target.value)}
              placeholder={t(
                support ? 'contact.supportPlaceholder' : 'contact.feedbackPlaceholder'
              )}
              required
              value={message}
            />
          </div>
          {error && <FormError error={error} />}
          <DialogFooter>
            <Button onClick={onClose} type="button" variant="ghost">
              {t('contact.cancel')}
            </Button>
            <Button disabled={loading || !message.trim()} type="submit">
              {loading ? t('contact.sending') : t('contact.send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
