import { DetailedHTMLProps, InputHTMLAttributes } from "react";

export default function DollarInput(
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) {
  return (
    <div className="group">
      <label
        className="capitalize text-zinc-500 mb-2 font-medium text-sm block"
        htmlFor={props.name}
      >
        {props.name}
      </label>
      <div className="flex items-center border-2 rounded-xl border-zinc-400/10 group-focus-within:border-blue-500 group-focus-within:border-2 group-focus-within:shadow-sm overflow-hidden">
        <p className="px-4 py-2 border-r h-full font-semibold text-zinc-500 group-focus-within:border-blue-500">
          $
        </p>
        <input id={props.name} {...props} className="p-2 outline-none w-full" />
      </div>
    </div>
  );
}
