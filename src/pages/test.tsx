import React from 'react'
import Image from '../components/Image/image'

import lqip from '../../public/images/owl.jpg?lqip'

const Test = (): React.ReactElement => {
  // console.log(filename)
  return (
    <>
      <div>
        <Image src={'/images/owl.jpg'} width={500} />
      </div>
    </>
  )
}

export default Test
