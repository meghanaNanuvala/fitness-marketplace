import type { Item } from "../../types/item";
import { formatUSD } from "../../utils/format";

type Props = {
  item: Item;
  onRemove: (id: string) => void;
};

export default function BuyerItemCard({ item, onRemove }: Props) {
  return (
    <li className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {item.category}
        </span>
        <time className="text-xs text-slate-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </time>
      </div>
      <h3 className="mb-1 line-clamp-1 text-base font-semibold">{item.title}</h3>
      {item.description && (
        <p className="mb-2 line-clamp-2 text-sm text-slate-600">{item.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm font-semibold">
          {formatUSD(item.priceCents)}
          <span className="ml-1 text-xs font-normal text-slate-500">× {item.qty}</span>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-100"
        >
          Remove
        </button>
      </div>
    </li>
  );
}


