import { useAuth } from '~/context/authcontext';
import { Stack, Redirect } from 'expo-router';
import { Container } from '~/components/Container';
import { Loading } from '~/components/Loading';

export default function Layout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Container className='bg-slate-950 items-center justify-center'>
        <Loading/>
      </Container>
    )
  }
  if(!session) {
    return <Redirect href={"/sign-in"} />
  }

  return <Stack/>
}
