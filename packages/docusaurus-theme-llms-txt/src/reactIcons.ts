/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Re-export the icons used by swizzlable source components. Ejected components
// then resolve react-icons through this package, which owns the dependency,
// including under pnpm's strict node_modules layout.
export { FaCode, FaCopy, FaMarkdown } from 'react-icons/fa';
export { FiChevronDown } from 'react-icons/fi';
export { MdCheck, MdFileCopy } from 'react-icons/md';
export { RiOpenaiFill } from 'react-icons/ri';
export { SiClaude } from 'react-icons/si';
