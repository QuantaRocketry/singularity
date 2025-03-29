import { ReactNode } from "react";

export const Header = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div className="card card-bordered card-compact shadow-md">
      <div className="card-body flex flex-row items-center">
        <h1 className="text-2xl">{title}</h1>
        <div className="flex-grow" />
        {children}
      </div>
    </div>
  );
};
