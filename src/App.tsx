import { useContext, useEffect } from 'react'
import { DatabaseContext } from './contexts/database'
import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <div className="text-sm text-[#ff0000]">{field.state.meta.errors.map(x => x.message).join(',')}</div>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

const schema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password should be at minimum 8 characters'),
});

function App() {
  const pb = useContext(DatabaseContext);
  const navigate = useNavigate();
  useEffect(() => {
      if (pb && pb.authStore.record) {
        navigate({ to: '/game' });
      }
  }, [])
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: async ({ value }) => {
      if (!pb) return;
      try {
        await pb.collection('users').authWithPassword(value.email, value.password);
      } catch {}
      if (pb.authStore.isValid) {
        navigate({ to: '/game' });
        return;
      }
      alert("Failed to authenticate");
      form.reset();
    }
  })
  return (
    <div className="text-center">
      <header className="min-h-screen flex items-center justify-center bg-[#202020] text-white text-[calc(10px+2vmin)]">
        <form className="flex flex-col gap-8" onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}>
          <form.Field name="email">
            {(field) => <div className="flex flex-col gap-2 items-start">
              <label htmlFor={field.name} className="text-lg">First Name</label>
              <input
                className="bg-[#efefef] text-black p-2 text-center outline-none rounded-sm"
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </div>}
          </form.Field>
          <form.Field name="password">
            {(field) => <div className="flex flex-col gap-2 items-start">
              <label htmlFor={field.name} className="text-lg">Password</label>
              <input
                className="bg-[#efefef] text-black p-2 text-center outline-none rounded-sm"
                type="password"
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </div>}
          </form.Field>
          <form.Subscribe selector={(state) => [
            state.canSubmit,
            state.isSubmitting
          ]}>
            {([canSubmit, isSubmitting]) => <div className="flex justify-center gap-4">
              <button className="cursor-pointer bg-[#101010] hover:bg-[#303030] p-4 pt-2 pb-2 rounded-sm" type="submit" disabled={!canSubmit}>
                {isSubmitting ? '...' : 'Submit'}
              </button>
              <button
              className="cursor-pointer bg-[#101010] hover:bg-[#303030] p-4 pt-2 pb-2 rounded-sm"
                type="reset"
                onClick={(e) => {
                  // Avoid unexpected resets of form elements (especially <select> elements)
                  e.preventDefault()
                  form.reset()
                }}
              >
                Reset
              </button>
            </div>}
          </form.Subscribe>
        </form>
      </header>
    </div>
  )
}

export default App
