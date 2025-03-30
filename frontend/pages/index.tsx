import { Inter } from "next/font/google";
import Head from "next/head";
import Button from "@/components/button";
import DollarInput from "@/components/input/dollar_input";
import PhoneNumberInput from "@/components/input/phone_number";
import axios, { AxiosError } from "axios";
import { FormEvent, FormEventHandler, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";

const notificationMethods = [
  { id: "deposit", title: "Deposit" },
  { id: "withdraw", title: "Withdraw" },
];

const useDisclosure = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return {
    isOpen,
    onOpen,
    onClose,
  };
};

export default function Home() {
  const [successData, setSuccessData] = useState<{
    confirmation_key: string;
    new_balance: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    message: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const phone = e.target.phone.value;
    const amount = e.target.amount.value;

    setIsLoading(true);

    const isDeposit = e.target.transaction_type[0].checked;
    const transaction_type = isDeposit ? "deposit" : "withdrawal";

    const phone_formatted = ""
      .concat(phone)
      .split("")
      .filter((item) => !!item && item !== " ")
      .join("");

    axios
      .post("https://cutcoin.up.railway.app/tx", {
        phone_number: "0" + phone_formatted,
        amount,
        transaction_type,
      })
      .then((res: any) => {
        setSuccessData(res.data);
      })
      .catch((err: AxiosError) => {
        setError({
          message: err.message,
        });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (successData) onOpen();
    if (error.message) onOpen();

    if (!successData && !error.message) onClose();
  }, [successData, onOpen, error, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSuccessData(null);
      setError({ message: "" });
    }
  }, [isOpen]);

  return (
    <main
      className={`flex h-screen w-screen flex-col items-center justify-center p-24 bg-zinc-100`}
    >
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Trigger />
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-zinc-900/20" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[320px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-3xl transition-all duration-300 delay-150">
            <Dialog.Title className="text-xl font-semibold tracking-tight">
              Transaction status
            </Dialog.Title>
            <Dialog.Description className="text-zinc-500">
              Your transaction has {successData ? "succeeded" : "failed"}
            </Dialog.Description>
            <div className="mt-4">
              {error.message && (
                <p className="text-red-500 font-semibold">{error.message}</p>
              )}
              {successData && (
                <table className="table-fixed w-full">
                  <thead>
                    <tr>
                      <td></td>
                      <td className="text-right"></td>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="font-semibold">Key</td>
                      <td>{successData.confirmation_key}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">New balance</td>
                      <td>
                        {Intl.NumberFormat("en-us", {
                          style: "currency",
                          currency: "USD",
                        }).format(parseInt(successData.new_balance))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            <Dialog.Close />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Head>
        <title>CUT Coin</title>
      </Head>
      <div className=" rounded-xl border border-zinc-400/30 w-full max-w-md bg-white shadow-sm">
        <div className="flex gap-2 items-center px-8 py-4 border-b">
          <Image
            src="/coin.png"
            alt="cut-coin-logo"
            width={24}
            height={24}
            className="w-6 h-6 bg-zinc-400 rounded-full"
          />
          <h1 className="font-bold text-xl tracking-tight text-zinc-900">
            CUT Coin
          </h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-8 p-8">
          <div className="space-y-4">
            <PhoneNumberInput name="phone" required />
            <DollarInput autoComplete="off" required name="amount" />
          </div>
          <div>
            <label className="text-base font-medium text-gray-900">
              Action
            </label>
            <p className="text-sm leading-5 text-gray-500">
              Which action do you want to perform?
            </p>
            <div className="mt-4">
              <legend className="sr-only">Action</legend>
              <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                {notificationMethods.map((notificationMethod, idx) => (
                  <label
                    htmlFor={notificationMethod.id}
                    key={notificationMethod.id}
                    className="flex items-center flex-1 border py-2 px-3 transition-all duration-300 rounded-xl has-[:checked]:ring-blue-500 has-[:checked]:ring-2 has-[:checked]:text-blue-900 has-[:checked]:bg-blue-100 font-semibold"
                  >
                    <input
                      id={notificationMethod.id}
                      defaultChecked={idx === 0}
                      name="transaction_type"
                      type="radio"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <p className="ml-3 block text-sm">
                      {notificationMethod.title}
                    </p>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <Button disabled={isLoading} className="w-full disabled:opacity-30">
            {isLoading ? "Loading..." : "Submit"}
          </Button>
        </form>
      </div>
    </main>
  );
}
