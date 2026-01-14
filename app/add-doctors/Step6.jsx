"use client";
import Btn from "../../component/Btn";

import { useRouter } from "next/navigation";

export default function Step6() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push("/otp-validation");
  };

  return (
    <div className='flex items-center justify-center'>
      <div className='bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center'>
        <h1 className='text-2xl font-semibold text-gray-900 mb-2'>All Set!</h1>

        <p className='text-gray-600 mb-6'>
          Your setup is complete. You can now access your dashboard.
        </p>

        <Btn
          variant='primary'
          onClick={handleGoToDashboard}
          className='w-full'
        >
          Go to Dashboard
        </Btn>
      </div>
    </div>
  );
}
