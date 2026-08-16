/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as router from '@test/mocks/docusaurus/router';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import useDropdownState from '../useDropdownState';

describe('useDropdownState', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useDropdownState());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggles open and closed', () => {
    const { result } = renderHook(() => useDropdownState());

    act(() => result.current.toggleDropdown());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggleDropdown());
    expect(result.current.isOpen).toBe(false);
  });

  it('closes when the route changes', () => {
    router.__setPathname('/docs/intro');
    const { result, rerender } = renderHook(() => useDropdownState());

    act(() => result.current.setIsOpen(true));
    expect(result.current.isOpen).toBe(true);

    act(() => router.__setPathname('/docs/other'));
    rerender();

    expect(result.current.isOpen).toBe(false);
  });

  // `dropdownRef` is typed RefObject<HTMLDivElement | null> -- the React 19
  // @types/react shape. Attaching it to a real element is what proves the
  // signature is honest under whichever @types/react major is installed.
  it('exposes a ref that attaches to a DOM node', () => {
    function Harness(): React.JSX.Element {
      const { dropdownRef, isOpen, toggleDropdown } = useDropdownState();
      return (
        <div ref={dropdownRef} data-testid='dropdown'>
          <button type='button' onClick={toggleDropdown}>
            toggle
          </button>
          <span data-testid='state'>{String(isOpen)}</span>
        </div>
      );
    }

    render(<Harness />);
    expect(screen.getByTestId('dropdown')).toBeInstanceOf(HTMLDivElement);
  });

  it('closes on an outside mousedown but not an inside one', async () => {
    const user = userEvent.setup();

    function Harness(): React.JSX.Element {
      const { dropdownRef, isOpen, toggleDropdown } = useDropdownState();
      return (
        <div>
          <div ref={dropdownRef} data-testid='dropdown'>
            <button type='button' onClick={toggleDropdown}>
              toggle
            </button>
            <span data-testid='state'>{String(isOpen)}</span>
          </div>
          <button type='button' data-testid='outside'>
            outside
          </button>
        </div>
      );
    }

    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('state')).toHaveTextContent('true');

    // Clicking inside the dropdown must not close it.
    await user.click(screen.getByTestId('dropdown'));
    expect(screen.getByTestId('state')).toHaveTextContent('true');

    await user.click(screen.getByTestId('outside'));
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });

  it('removes its document listener on unmount', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    const { result, unmount } = renderHook(() => useDropdownState());

    act(() => result.current.setIsOpen(true));
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
