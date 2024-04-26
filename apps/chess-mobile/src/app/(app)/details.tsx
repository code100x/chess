import { Stack, useLocalSearchParams } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { useEffect } from 'react';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Details() {
  const { name } = useLocalSearchParams();
  const auth = async () =>{
    const res = await openBrowserAsync('https://dynamic-honeybee-humorous.ngrok-free.app/auth/refresh');
    console.log(res);
    
  }
  useEffect(()=>{
    auth();
  },[])

  return (
    <>
      <Container>
        <ScreenContent path="screens/details.tsx" title={`Showing details for user ${name}`} />
      </Container>
    </>
  );
}
