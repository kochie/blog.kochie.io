import React from 'react'
import Card from '../Card'

const Icon = (
  <svg
    height="30px"
    viewBox="0 0 76 90"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    className=""
  >
    <g id="revue" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <path
        d="M37.0318819,50.3968732 C40.2417014,35.6207535 41.3628114,31.1848689 41.3628114,28.5615541 C41.3628114,22.7666511 38.0181974,21.7967985 34.6050241,21.7967985 C30.4632412,21.7967985 27.4762105,24.8449067 27.4762105,24.8449067 C29.8677171,29.2031903 25.8307895,44.7463899 24.0737917,51.0511045 C21.9498004,58.7023134 19.0165417,69.990806 17.1748531,77.1658321 C15.3358531,84.3422034 28.1483596,82.4132593 29.0060219,80.2865784 C29.9446099,77.9846419 32.4047119,69.5381884 34.6309263,60.6629825 C38.3664761,59.4986498 42.6466162,57.8481437 42.6466162,57.8481437 C42.6466162,57.8481437 49.6342785,89.4820187 63.8125921,89.4820187 C73.5950504,89.4820187 74.6745219,81.1891735 72.768307,80.2798526 C60.4384035,74.3840634 53.3539518,54.0306101 53.3539518,54.0306101 C53.3539518,54.0306101 75.184011,44.9589235 75.184011,26.4281474 C75.184011,7.87181343 60.125182,0.0484253731 44.9157917,0.0484253731 C28.0287171,0.0484253731 9.26500219,9.16181157 1.16560526,26.7980634 C-3.94541667,37.9466604 10.742386,41.4198358 11.468307,37.9466604 C13.8598136,26.5519011 26.5567105,8.61164552 45.0394671,8.61164552 C54.7856294,8.61164552 60.4962083,15.0481847 60.4962083,26.4281474 C60.4962083,40.5430474 44.240877,47.9837905 37.0318819,50.3968732 Z"
        id="Combined-Shape"
        className="fill-current duration-300 group-hover:fill-[#E15718]"
        // fill="#E15718"
        fill="white"
      ></path>
    </g>
  </svg>
)

const Revue = () => {
  return (
    <div
      id="revue-embed"
      className="relative max-w-5xl mx-auto px-4 mb-0 pb-10 mt-10"
    >
      <Card>
        <form
          className="p-4 md:p-8 lg:p-14 group"
          action="http://newsletter.kochie.io/add_subscriber"
          method="post"
          id="revue-form"
          name="revue-form"
          target="_blank"
        >
          <div className="flex mb-5 items-center">
            {/* <div className="">{Icon}</div> */}
            <h1 className="text-2xl">
              Like what you see? <br />
              Find out when I sporadically scream into the void...
            </h1>
          </div>
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <label
                htmlFor="member_email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-100"
              >
                Email Address
              </label>
              <input
                className="text-black px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:text-white dark:bg-stone-900"
                placeholder="tony@stark.industries"
                type="email"
                name="member[email]"
                id="member_email"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="member_first_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-100"
              >
                First Name <span className="optional">(Optional)</span>
              </label>
              <input
                className="text-black px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:text-white dark:bg-stone-900"
                placeholder="Tony"
                type="text"
                name="member[first_name]"
                id="member_first_name"
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="member_last_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-100"
              >
                Last Name <span className="optional">(Optional)</span>
              </label>
              <input
                className="text-black px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:text-white dark:bg-stone-900"
                placeholder="Stark"
                type="text"
                name="member[last_name]"
                id="member_last_name"
              />
            </div>
            <div className="col-span-6 md:col-span-1">
              <input
                type="submit"
                value="Subscribe"
                name="member[subscribe]"
                id="member_submit"
                className="w-full p-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded transform duration-200 cursor-pointer"
              />
            </div>
            <div className="col-span-5 md:col-span-4 my-auto">
              By subscribing, you agree with Revue&apos;s{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.getrevue.co/terms"
                className="underline text-orange-500 hover:text-orange-600 transform duration-200"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.getrevue.co/privacy"
                className="underline text-orange-500 hover:text-orange-600 transform duration-200"
              >
                Privacy Policy
              </a>
              .
            </div>
            <div className="col-span-1 justify-self-end self-center mr-5 hover:fill-orange-600">
              {Icon}
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default Revue
