export default function FormCheckbox({
  id,
  name,
  defaultChecked,
  label,
  description,
}: {
  id: string;
  name: string;
  defaultChecked?: boolean;
  label: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input type="hidden" name={`${name}_present`} value="1" />
        <input
          type="checkbox"
          id={id}
          name={name}
          defaultChecked={defaultChecked}
          className="h-4 w-4 rounded border border-neutral-300"
        />
        <label htmlFor={id} className="text-sm font-medium leading-none">
          {label}
        </label>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground pl-6">{description}</p>
      )}
    </div>
  );
}
