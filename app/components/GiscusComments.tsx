'use client';

import { usePathname } from 'next/navigation';
import Giscus from '@giscus/react';

export function GiscusComments() {
  const pathname = usePathname();
  
  return (
    <Giscus
      id="comments"
      repo="jrbauhaus/sbir-dashboard-next"
      repoId="R_kgDOOZtNDQ"
      category="SBIR Discussions"
      categoryId="DIC_kwDOOZtNDc4CpGol"
      mapping="pathname"
      term={pathname}
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme="preferred_color_scheme"
      lang="en"
      loading="lazy"
      host="https://giscus.app"
    />
  );
}