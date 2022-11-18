import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const setup = async () => {
  const utils = render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  const searchAutocomplete = await screen.findByTestId('autocomplete');
  const searchAutocompleteInput = await within(searchAutocomplete).findByRole('combobox');

  return {
    user: userEvent.setup(),
    searchAutocomplete,
    searchAutocompleteInput,
    ...utils
  };
};

describe('Test Home Component', () => {
  test('renders search', async () => {
    const { searchAutocomplete } = await setup();

    expect(searchAutocomplete).toBeInTheDocument();
  });

  test('autocompletes search for S&P 500 component (AAPL)', async () => {
    const { user, searchAutocomplete, searchAutocompleteInput } = await setup();

    await user.type(searchAutocomplete, 'AAPL');
    expect(searchAutocompleteInput).toHaveValue('AAPL');
  });

  test('selects S&P 500 stock (AAPL)', async () => {
    // const { user, searchAutocomplete } = await setup();
    const { searchAutocompleteInput } = await setup();

    // user.type(searchAutocomplete, 'a');
    // await fireEvent.change(searchAutocompleteInput, { target: { value: 'a' } });
    // await fireEvent.keyDown(searchAutocomplete, { key: 'ArrowDown' });
    // await fireEvent.keyDown(searchAutocomplete, { key: 'Enter' });

    fireEvent.mouseDown(searchAutocompleteInput);
    const opt = screen.getByText('Agilent Technologies (A)');
    fireEvent.click(opt);

    expect(searchAutocompleteInput).toHaveValue('a');
  });
});
