'use client';

import type { Team } from '@/components/bracket';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export interface ChampionshipScoreModalProps {
  champion: Team;
  opponent: Team;
  /** Champion's points, opponent's points */
  onSubmit: (championScore: number, opponentScore: number) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function ChampionshipScoreModal({
  champion,
  opponent,
  onSubmit,
  onCancel,
  submitLabel = 'Create Prediction',
}: ChampionshipScoreModalProps) {
  const scoreSchema = z
    .object({
      championScore: z
        .string()
        .refine((val) => val === '' || !isNaN(Number(val)), {
          message: 'Must be a valid number',
        })
        .refine((val) => val === '' || Number(val) >= 0, {
          message: 'Score must be a non-negative number',
        }),
      opponentScore: z
        .string()
        .refine((val) => val === '' || !isNaN(Number(val)), {
          message: 'Must be a valid number',
        })
        .refine((val) => val === '' || Number(val) >= 0, {
          message: 'Score must be a non-negative number',
        }),
    })
    .refine(
      (data) => {
        if (data.championScore === '' || data.opponentScore === '') return true;
        return Number(data.championScore) !== Number(data.opponentScore);
      },
      {
        message: 'Scores cannot be tied',
        path: ['championScore'],
      }
    )
    .refine(
      (data) => {
        if (data.championScore === '' || data.opponentScore === '') return true;
        return Number(data.championScore) > Number(data.opponentScore);
      },
      {
        message: `${champion.name} score must be higher than ${opponent.name} score`,
        path: ['championScore'],
      }
    );

  const scoreForm = useForm<z.infer<typeof scoreSchema>>({
    resolver: zodResolver(scoreSchema),
    defaultValues: { championScore: '', opponentScore: '' },
    mode: 'onChange',
  });

  const handleFormSubmit = (data: z.infer<typeof scoreSchema>) => {
    onSubmit(Number(data.championScore), Number(data.opponentScore));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">Predict Final Score</h2>

        <div className="mb-6">
          <p className="mb-2 text-gray-600">
            You predicted <span className="font-semibold">{champion.name}</span> to win the championship.
          </p>
          <p className="text-sm text-gray-500">Enter your predicted final score to complete your bracket.</p>
        </div>
        <Form {...scoreForm}>
          <form onSubmit={scoreForm.handleSubmit(handleFormSubmit)}>
            <FormField
              name="championScore"
              control={scoreForm.control}
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="mb-1 block text-sm font-medium text-gray-700">{champion.name} Score</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="opponentScore"
              control={scoreForm.control}
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="mb-1 block text-sm font-medium text-gray-700">{opponent.name} Score</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                {submitLabel}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
