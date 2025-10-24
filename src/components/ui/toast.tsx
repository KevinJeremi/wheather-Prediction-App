"use client";

// Wrapper for sonner toast library
// This provides compatibility with the shadcn/ui toast API
import { toast as sonnerToast } from "sonner";

// Re-export sonner types
export type ToastProps = Record<string, unknown>;

// Create a wrapper that matches shadcn/ui toast API
const toast = (props: any) => {
  if (typeof props === "string") {
    return sonnerToast(props);
  }

  const { title, description, variant = "default", ...rest } = props;
  const message = description || title;

  if (variant === "destructive") {
    return sonnerToast.error(message, rest);
  }

  return sonnerToast(message, rest);
};

// Dummy components for compatibility
const ToastProvider = ({ children }: { children: React.ReactNode }) => children;
const ToastViewport = () => null;
const Toast = ({ children }: { children?: React.ReactNode }) =>
  children || null;
const ToastTitle = ({ children }: { children?: React.ReactNode }) =>
  children || null;
const ToastDescription = ({ children }: { children?: React.ReactNode }) =>
  children || null;
const ToastClose = () => null;
const ToastAction = () => null;

type ToastActionElement = React.ReactElement;

export {
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toast,
};
