import React, { PropsWithChildren, ReactElement } from 'react'

const Card = ({
  children,
}: PropsWithChildren<Record<never, any>>): ReactElement => {
  return (
    <div className="shadow-2xl rounded-2xl transition ease-in-out duration-200 bg-gray-300 dark:bg-trueGray-600 text-black dark:text-white w-full h-full z-20">
      {children}
    </div>
  )
}

export default Card
