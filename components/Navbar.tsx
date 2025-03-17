import Image from "next/image";
import { auth, signOut, signIn } from "@/auth";
import Link from "next/link";

const Navbar = async () => {
  const session = await auth();

  return (
    <header className="px-5 bg-greenAccent shadow-lg font-work-sans border-b-4 border-black">
      <nav className="flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center gap-5 rounded-lg p-2 bg-greenAccent">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="logo"
              width={90}
              height={30}
              className="border-4 border-black rounded-lg"
            />
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {session && session?.user ? (
            <>
              <Link href="/upload">
                <button className="customBtn01">Learn</button>
              </Link>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="customBtn01">
                  Logout
                </button>
              </form>

              <Link href="/UserDashboard">
                <span className="flex items-center gap-2 customBtn01">
                  <Image
                    src={session.user?.image || "Image"}
                    alt={`${session?.user?.name || "User"} Avatar`}
                    width={40}
                    height={40}
                    className="rounded-full border border-black object-cover"
                  />
                  {session.user?.name || "User"}
                </span>
              </Link>

            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button type="submit" className="customBtn01">
                Login
              </button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
