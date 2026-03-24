'use client';

import type { Team } from '@/components/bracket';
import { useEffect } from 'react';
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
  const digitScoreField = z
    .string()
    .trim()
    .min(1, { message: 'Enter a score' })
    .regex(/^\d+$/, { message: 'Must be a valid number' });

  const scoreSchema = z
    .object({
      championScore: digitScoreField,
      opponentScore: digitScoreField,
    })
    .refine(
      (data) => {
        return (
          Number.parseInt(data.championScore, 10) !==
          Number.parseInt(data.opponentScore, 10)
        );
      },
      {
        message: 'Scores cannot be tied',
        path: ['championScore'],
      }
    )
    .refine(
      (data) => {
        return (
          Number.parseInt(data.championScore, 10) >
          Number.parseInt(data.opponentScore, 10)
        );
      },
      {
        message: `${champion.name} score must be higher than ${opponent.name} score`,
        path: ['championScore'],
      }
    );

  type ScoreFormValues = z.infer<typeof scoreSchema>;

  const scoreForm = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: { championScore: '0', opponentScore: '0' },
    mode: 'onChange',
  });

  const { trigger, formState } = scoreForm;
  const { isValid, isSubmitting } = formState;

  useEffect(() => {
    void trigger();
  }, [trigger]);

  const handleFormSubmit = (data: ScoreFormValues) => {
    onSubmit(
      Number.parseInt(data.championScore, 10),
      Number.parseInt(data.opponentScore, 10)
    );
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
                      type="number"
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
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
