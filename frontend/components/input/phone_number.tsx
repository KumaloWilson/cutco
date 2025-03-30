import {
  ChangeEvent,
  DetailedHTMLProps,
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import Flag from "react-world-flags";

export default function PhoneNumberInput(
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const htmlElement = ref.current;
    if (!htmlElement) return;

    const onChangeEventListener = (e: Event) => {
      const splitAt3 = (val: string) => {
        const newVal = value.split("");
        newVal.splice(3, 0, " ");
        const stringified = newVal.join("");
        return stringified;
      };

      const value = htmlElement.value;
      let formatted = "";
      if (value.length > 3) {
        if (value[3] === " ") return;
        formatted = splitAt3(value);
      }

      if (value.length > 7) {
        if (value[7] === " ") return;
        const newVal = formatted.split("").filter((item) => !!item);
        console.log({ newVal });
        newVal.splice(7, 0, " ");
        const stringified = newVal.join("");
        setValue(stringified);
      }
    };

    htmlElement.addEventListener("change", onChangeEventListener);
    return () =>
      htmlElement.removeEventListener("change", onChangeEventListener);
  }, []);

  return (
    <div className="group">
      <label
        className="capitalize text-zinc-500 mb-2 font-medium text-sm block"
        htmlFor={props.name}
      >
        {props.name}
      </label>
      <div className="flex items-center border-2 rounded-xl border-zinc-400/10 group-focus-within:border-blue-500 group-focus-within:border-2 group-focus-within:shadow-sm overflow-hidden">
        <p className="px-4 w-fit py-2 border-r inline-flex gap-2 h-full font-semibold text-zinc-700 group-focus-within:border-blue-500">
          <Flag code="zw" height="16" className="w-6" />
          +263
        </p>
        <input
          ref={ref}
          id={props.name}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (props.onChange) props.onChange(e);
          }}
          {...props}
          className="p-2 outline-none flex-1"
          placeholder="712 345 678"
        />
      </div>
    </div>
  );
}
