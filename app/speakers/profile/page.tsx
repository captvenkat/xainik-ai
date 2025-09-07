import { auth } from "@/lib/auth";
import ProfileForm from "@/app/components/ProfileForm";

export default async function ProfilePage(){
  const session = await auth();
  if (!session?.user) {
    return <div className="card"><p>Please login from <a href="/api/auth/signin">here</a>.</p></div>
  }
  return (
    <div>
      <h1>My Speaker Profile</h1>
      <ProfileForm/>
    </div>
  );
}
