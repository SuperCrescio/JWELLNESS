import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const CardFallback = ({ message }) => {
  return (
    <Card className="p-6 bg-yellow-50/50 border-yellow-200">
      <CardContent className="p-0 flex items-center justify-center text-center text-yellow-700">
        <AlertTriangle className="w-8 h-8 mr-4" />
        <p className="text-sm">{message}</p>
      </CardContent>
    </Card>
  );
};

export default CardFallback;