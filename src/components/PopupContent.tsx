interface PopupContentProps {
  properties: Record<string, any>;
}

export default function PopupContent({ properties }: PopupContentProps) {
  return (
    <div className="p-2 min-w-[200px]">
      <h3 className="font-semibold text-lg mb-2 text-foreground">
        {properties.name || "Feature"}
      </h3>
      <div className="space-y-1">
        {Object.entries(properties).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4 text-sm">
            <span className="font-medium text-muted-foreground capitalize">
              {key}:
            </span>
            <span className="text-foreground">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
