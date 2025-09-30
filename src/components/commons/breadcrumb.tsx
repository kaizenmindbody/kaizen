import Link from "next/link";

const Breadcrumb = ({
  pageName,
  description,
}: {
  pageName: string;
  description?: string;
}) => {
  return (
    <>
      <section
        className="relative z-10 overflow-hidden pt-28 lg:pt-[150px]"
      >
        <div
          className="py-12"
          style={{
            backgroundImage: `url('/images/breadcrumb.jpg')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
          <div className="container">
            <div className="flex justify-center w-full px-4 mb-2">
              <ul className="flex items-center text-secondary text-base">
                <li className="flex items-center">
                  <Link
                    href="/"
                    className="pr-1 font-medium hover:text-primary"
                  >
                    Home
                  </Link>
                  <span className="mr-3 block h-2 w-2 rotate-45 border-r-2 border-t-2 border-body-color"></span>
                </li>
                <li className="font-medium">
                  {pageName}
                </li>
              </ul>
            </div>
            <div className="text-center w-full px-4">
              <div>
                <h1 className="mb-5 text-2xl text-secondary dark:text-white sm:text-3xl">
                  {pageName}
                </h1>
                <p className="mb-4 text-base font-medium leading-relaxed text-secondary">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Breadcrumb;
