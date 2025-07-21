import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { User, Mail, Save, Key, Weight, Ruler, Calendar, Cake, HeartPulse, Loader2 } from 'lucide-react';
import { syncHealthData } from '@/lib/healthBridge';

const UserProfile = ({ userData, updateUserData, userEmail, onSyncComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    height_cm: '',
    weight_kg: '',
    date_of_birth: '',
  });
  const { toast } = useToast();
  const { user, resetPassword } = useAuth();

  useEffect(() => {
    if (userData) {
      setProfileData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        height_cm: userData.height_cm || '',
        weight_kg: userData.weight_kg || '',
        date_of_birth: userData.date_of_birth || '',
      });
    }
  }, [userData]);

  const age = useMemo(() => {
    if (!profileData.date_of_birth) return null;
    const birthDate = new Date(profileData.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [profileData.date_of_birth]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    const updates = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      height_cm: profileData.height_cm ? parseInt(profileData.height_cm, 10) : null,
      weight_kg: profileData.weight_kg ? parseFloat(profileData.weight_kg) : null,
      date_of_birth: profileData.date_of_birth || null,
    };
    updateUserData(updates);
    setIsEditing(false);
    toast({
      title: "Profilo Aggiornato",
      description: "I tuoi dati sono stati salvati con successo.",
    });
  };

  const handlePasswordReset = async () => {
    await resetPassword(userEmail);
  };

  const handleHealthSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    toast({
      title: "Sincronizzazione in corso...",
      description: "Stiamo tentando di connetterci alle API di salute del tuo dispositivo.",
    });
    try {
      const result = await syncHealthData(user.id);
      if (result.success) {
        toast({
          title: "Sincronizzazione Completata!",
          description: `${result.syncedCount} nuovi dati sono stati salvati con successo.`,
        });
        if(onSyncComplete) onSyncComplete();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sincronizzazione Fallita",
        description: error.message || "Non è stato possibile sincronizzare i dati.",
      });
    } finally {
      setIsSyncing(false);
    }
  };


  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Profilo Utente
        </h1>
        <p className="text-gray-600">
          Gestisci i tuoi dati personali e le impostazioni dell'account.
        </p>
      </motion.div>

      <Card className="p-6 glass-effect border-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Dati Personali</h2>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Modifica</Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="first_name" value={profileData.first_name} onChange={handleInputChange} disabled={!isEditing} className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Cognome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="last_name" value={profileData.last_name} onChange={handleInputChange} disabled={!isEditing} className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="email" value={userEmail} disabled className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Data di Nascita</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="date_of_birth" type="date" value={profileData.date_of_birth} onChange={handleInputChange} disabled={!isEditing} className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height_cm">Altezza (cm)</Label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="height_cm" type="number" value={profileData.height_cm} onChange={handleInputChange} disabled={!isEditing} className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight_kg">Peso (kg)</Label>
            <div className="relative">
              <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="weight_kg" type="number" step="0.1" value={profileData.weight_kg} onChange={handleInputChange} disabled={!isEditing} className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Età</Label>
            <div className="relative">
              <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="age" value={age !== null ? `${age} anni` : 'N/D'} disabled className="pl-9" />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => {
              setIsEditing(false);
              setProfileData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                height_cm: userData.height_cm || '',
                weight_kg: userData.weight_kg || '',
                date_of_birth: userData.date_of_birth || '',
              });
            }}>Annulla</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salva Modifiche
            </Button>
          </div>
        )}
      </Card>
      
      <Card className="p-6 glass-effect border-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Integrazioni Salute</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Sincronizza i dati da Apple Salute o Google Fit.</p>
          <Button variant="secondary" onClick={handleHealthSync} disabled={isSyncing}>
            {isSyncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <HeartPulse className="w-4 h-4 mr-2" />
            )}
            {isSyncing ? 'Sincronizzando...' : 'Sincronizza Dati Salute'}
          </Button>
        </div>
      </Card>

      <Card className="p-6 glass-effect border-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Sicurezza</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Vuoi cambiare la tua password?</p>
          <Button variant="secondary" onClick={handlePasswordReset}>
            <Key className="w-4 h-4 mr-2" />
            Recupera Password
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;