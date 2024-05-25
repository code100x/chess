//TODO: Make prettier
import { BallTriangle } from 'react-loader-spinner'

export const Loader = () => {
  return <div className='h-screen flex items-center justify-center'>
          <BallTriangle
            height={100}
            width={100}
            radius={5}
            color="#4fa94d"
            ariaLabel="ball-triangle-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            />
          </div>

};
