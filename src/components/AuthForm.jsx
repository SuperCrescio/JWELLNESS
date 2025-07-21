import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog.jsx";
const AuthForm = () => {
  const {
    signIn,
    signUp,
    resetPassword
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const handleSignUp = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const {
      error
    } = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName
    });
    if (!error) {
      setShowConfirmation(true);
    }
    setIsSubmitting(false);
  };
  const handleSignIn = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    await signIn(email, password);
    setIsSubmitting(false);
  };
  const handlePasswordReset = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await resetPassword(resetEmail);
    if (success) {
      setShowResetPassword(false);
      setResetEmail('');
    }
    setIsSubmitting(false);
  };
  return <>
      <Card className="w-full max-w-sm p-8 glass-effect border-0 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">JWellness - WellnessTracker</h1>
          <p className="text-gray-600 mt-2">{isLoginView ? 'Accedi al tuo account' : 'Crea un nuovo account'}</p>
        </div>
        <form onSubmit={isLoginView ? handleSignIn : handleSignUp} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isLoginView && <motion.div key="name-fields" initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} transition={{
            duration: 0.3
          }} className="overflow-hidden">
                <div className="flex gap-4">
                  <div className="space-y-2 w-1/2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2 w-1/2">
                    <Label htmlFor="lastName">Cognome</Label>
                    <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required disabled={isSubmitting} />
                  </div>
                </div>
              </motion.div>}
          </AnimatePresence>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="mario.rossi@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white" disabled={isSubmitting}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={isSubmitting ? "submitting" : "submit"} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -10
              }} transition={{
                duration: 0.2
              }}>
                  {isSubmitting ? "Caricamento..." : isLoginView ? "Accedi" : "Registrati"}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-purple-600 hover:underline" disabled={isSubmitting}>
            {isLoginView ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
        {isLoginView && <div className="mt-4 text-center">
            <button onClick={() => setShowResetPassword(true)} className="text-sm text-gray-500 hover:underline" disabled={isSubmitting}>
              Password dimenticata?
            </button>
          </div>}
      </Card>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrazione quasi completata!</AlertDialogTitle>
            <AlertDialogDescription>
              Ti abbiamo inviato un'email di conferma. Per favore, controlla la tua casella di posta e clicca sul link per attivare il tuo account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowConfirmation(false)}>Ho capito</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recupero Password</AlertDialogTitle>
            <AlertDialogDescription>
              Inserisci l'email associata al tuo account per ricevere le istruzioni di recupero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handlePasswordReset}>
            <div className="space-y-2 my-4">
              <Label htmlFor="reset-email">Email</Label>
              <Input id="reset-email" type="email" placeholder="mario.rossi@email.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required disabled={isSubmitting} />
            </div>
            <AlertDialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowResetPassword(false)}>Annulla</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Invio..." : "Invia link"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>;
};
export default AuthForm;