import React from 'react'
import Card from '../Card'

const Revue = () => {
  return (
    <div
      id="revue-embed"
      className="relative max-w-5xl mx-auto px-4 mb-0 pb-10 mt-10"
    >
      <Card>
        <form
          className="p-4 md:p-8 lg:p-14"
          action="http://newsletter.kochie.io/add_subscriber"
          method="post"
          id="revue-form"
          name="revue-form"
          target="_blank"
        >
          <h1 className="text-2xl mb-5">
            Like what you see...? <br />
            Find out when I sporadically scream into the void
          </h1>
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <label
                htmlFor="member_email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-100"
              >
                Email Address
              </label>
              <input
                className="text-black px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
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
                className="text-black px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
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
                className="text-black px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
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
            <div className="col-span-6 md:col-span-5 my-auto">
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
          </div>
        </form>
      </Card>
    </div>
  )
}

export default Revue
