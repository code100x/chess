import { MobileSidebar } from '@/components/mobile-sidebar';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  // const { data: sessionData } = useSession();
  const navigate = useNavigate();
  return (
    <div className="chess-board supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 backdrop-blur  md:hidden text-white">
      <nav className="flex h-16 items-center justify-between px-4">
        <div>
          <MobileSidebar />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={'ghost'}
            onClick={() => {
              navigate('/login');
            }}
          >
            Login
          </Button>
          {/*   {sessionData?.user ? ( */}
          {/*     <UserNav user={sessionData.user} /> */}
          {/*   ) : ( */}
          {/*     <Button */}
          {/*       size="sm" */}
          {/*       //   onClick={() => { */}
          {/*       //     void signIn(); */}
          {/*       //   }} */}
          {/*     > */}
          {/*       Sign In */}
          {/*     </Button> */}
          {/*   )} */}
        </div>
      </nav>
    </div>
  );
}
