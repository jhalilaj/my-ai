import Image from "next/image";
import { auth, signOut } from "@/auth";
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
          {session && session.user ? (
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
                <button className="customBtn01 inline-flex items-center gap-2 overflow-visible">
                  <Image
                    src={session.user.image || "/default-avatar.png"}
                    alt={`${session.user.name} Avatar`}
                    width={24}
                    height={24}
                    className="rounded-full border border-black object-cover transform scale-125"
                  />
                  <span className="text-sm">{session.user.name}</span>
                </button>
              </Link>
            </>
          ) : (
            <div className="flex gap-3">
              <Link href="/signup">
                <button className="customBtn01">Get Started</button>
              </Link>
              <Link href="/login">
                <button className="customBtn01">Login</button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
