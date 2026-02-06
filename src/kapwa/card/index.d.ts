import { default as React } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}
declare const Card: ({
  children,
  className,
  hoverable,
  ...props
}: CardProps) => import('react/jsx-runtime').JSX.Element;
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
declare const CardHeader: ({
  children,
  className,
  ...props
}: CardHeaderProps) => import('react/jsx-runtime').JSX.Element;
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
declare const CardContent: ({
  children,
  className,
  ...props
}: CardContentProps) => import('react/jsx-runtime').JSX.Element;
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
declare const CardFooter: ({
  children,
  className,
  ...props
}: CardFooterProps) => import('react/jsx-runtime').JSX.Element;
interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}
declare const CardImage: ({
  className,
  ...props
}: CardImageProps) => import('react/jsx-runtime').JSX.Element;
export { Card, CardHeader, CardContent, CardFooter, CardImage };
