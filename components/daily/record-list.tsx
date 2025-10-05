interface RecordListProps {
  title: string;
  records: Array<{
    value: string | number;
    label: string;
  }>;
}

export function RecordList({ title, records }: RecordListProps) {
  if (records.length === 0) {
    return (
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
          {title}
        </h4>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground text-right">No data</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-md font-semibold mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{records[0].value}</div>
          <p className="text-xs text-muted-foreground text-right">
            {records[0].label}
          </p>
        </div>
        {records.slice(1).map((record, idx) => (
          <div
            key={idx}
            className="pt-2 border-t border-border/50 flex items-center justify-between"
          >
            <div
              className={
                idx === 0
                  ? "text-lg font-semibold text-muted-foreground"
                  : "text-sm font-medium text-muted-foreground"
              }
            >
              {record.value}
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {record.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
