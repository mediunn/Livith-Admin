'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DataFormProps {
  table: string;
  fields: Array<{ name: string; type: string; required?: boolean }>;
  serverAction: (prevState: any, formData: FormData) => Promise<any>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30 disabled:opacity-50"
    >
      {pending ? '저장 중...' : '저장'}
    </Button>
  );
}

export function DataForm({ table, fields, serverAction }: DataFormProps) {
  const initialState = { success: false, message: '' };
  const [state, formAction] = useFormState(serverAction, initialState);

  return (
    <div className="border border-livith-black-30 rounded-lg p-6 bg-livith-white">
      <h3 className="text-lg font-semibold text-livith-black-100 mb-4">
        {table} 데이터 추가
      </h3>

      <form action={formAction} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-livith-black-90 mb-1">
              {field.name}
              {field.required && <span className="text-livith-caution ml-1">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <Textarea
                name={field.name}
                required={field.required}
                className="w-full"
                placeholder={`${field.name} 입력`}
              />
            ) : (
              <Input
                type={field.type}
                name={field.name}
                required={field.required}
                className="w-full"
                placeholder={`${field.name} 입력`}
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-4 pt-4">
          <SubmitButton />
          {state.message && (
            <p
              className={`text-sm ${
                state.success ? 'text-livith-black-100' : 'text-livith-caution'
              }`}
            >
              {state.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
