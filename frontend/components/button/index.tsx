import { ButtonHTMLAttributes, DetailedHTMLProps, HTMLProps } from "react";

export default function Button(
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) {
  return (
    <button
      {...props}
      className={
        "px-3 py-1.5 rounded-full bg-blue-600 text-white font-semibold " +
        props.className
      }
    />
  );
}
