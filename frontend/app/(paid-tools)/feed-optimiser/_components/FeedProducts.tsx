'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { FeedProduct } from '@/lib/types';

interface FeedProductsProps {
  data: FeedProduct[];
  success: string;
  error: string;
}

export default function FeedProducts({
  data,
  success,
  error,
}: FeedProductsProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (success) {
      toast({ title: 'Feed created successfully' });
    }
    if (error) {
      toast({
        title: 'Error creating feed',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  }, [success, error]);

  return (
    <div>
      <h2>Products</h2>
      {data.map((product) => (
        <div className="flex" key={product.product_id}>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
          <p>{product.link}</p>
          <p>{product.image_link}</p>
          <p>{product.availability}</p>
          <p>{product.price}</p>
          <p>{product.color}</p>
          <p>{product.product_type}</p>
          <p>{product.brand}</p>
          <p>{product.identifier_exists}</p>
          <p>{product.material}</p>
          <p>{product.condition}</p>
          <p>{product.size}</p>
        </div>
      ))}
    </div>
  );
}
