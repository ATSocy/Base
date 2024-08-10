import * as React from "react";
import styled from "styled-components";
import breakpoint from "styled-components-breakpoint";
import { depths, s } from "@shared/styles";
import env from "~/env";
import AtsocyIcon from "./Icons/AtsocyIcon";

type Props = {
  href?: string;
};

function Branding({ href = env.URL }: Props) {
  return (
    <Link href={href}>
      <AtsocyIcon size={20} />
      &nbsp;ATSocy.com
    </Link>
  );
}

const Link = styled.a`
  justify-content: center;
  padding-bottom: 16px;

  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  border-radius: 4px;
  color: ${s("text")};
  display: flex;
  align-items: center;

  svg {
    fill: ${s("text")};
  }

  ${breakpoint("tablet")`
    z-index: ${depths.sidebar + 1};
    background: ${s("sidebarBackground")};
    position: fixed;
    bottom: 0;
    right: 0;
    padding: 16px;

    &:hover {
      background: ${s("sidebarControlHoverBackground")};
    }
  `};
`;

export default Branding;
