import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SmartForm({
  title,
  fields = [],
  defaultValues = {},
  validationSchema,
  onSubmit,
  submitText = "Save",
  loading = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: validationSchema
      ? zodResolver(validationSchema)
      : undefined,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-6 text-2xl font-bold">
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name}>

            <label className="mb-2 block text-sm font-medium">
              {field.label}
            </label>

            {field.type === "textarea" ? (
              <textarea
                {...register(field.name)}
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            ) : field.type === "select" ? (
              <select
                {...register(field.name)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-600"
              >
                <option value="">Select...</option>

                {field.options?.map((option) => (
                  <option
                    key={
                      option.value ??
                      option
                    }
                    value={
                      option.value ??
                      option
                    }
                  >
                    {option.label ??
                      option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                {...register(field.name)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            )}

            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-500">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : submitText}
        </button>
      </div>
    </form>
  );
}