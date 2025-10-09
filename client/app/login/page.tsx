import Link from "next/link";

const Login = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold">Login Page</h1>
      <Link href="/workspace" className="ml-4 text-blue-500 underline">
        Login
      </Link>
    </div>
  );
};

export default Login;
