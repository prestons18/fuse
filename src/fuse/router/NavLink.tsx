import { h } from "../dom";
import { computed } from "../reactivity";
import { Router } from "./Router";

export interface NavLinkProps {
  href: string;
  className?: string;
  activeClassName?: string;
  children?: any;
  [key: string]: any;
}

export function createNavLink(router: Router) {
  return function NavLink(props: NavLinkProps) {
    const { 
      href, 
      className = "", 
      activeClassName = "active", 
      children, 
      ...rest 
    } = props;
    
    const match = router.match(href);
    
    const linkClassName = computed(() => {
      const isActive = match.value !== null;
      return `${className}${isActive ? ` ${activeClassName}` : ""}`.trim();
    });
    
    return (
      <a
        href={href}
        className={linkClassName}
        onClick={(e: Event) => {
          e.preventDefault();
          router.navigate(href);
        }}
        {...rest}
      >
        {children}
      </a>
    );
  };
}
