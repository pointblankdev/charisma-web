import { useState } from 'react';
import { Button } from './ui/button';

const SearchBar = ({ onSearch }: any) => {
    const [contractAddress, setContractAddress] = useState('');

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onSearch(contractAddress);
    };

    return (
        <form onSubmit={handleSubmit} className="flex space-x-4 p-4 my-2 w-[512px]">
            <input
                type="text"
                placeholder="Contract Address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="border rounded p-2 flex-grow"
            />
            <Button type="submit" className="text-white rounded p-2">
                Search
            </Button>
        </form>
    );
};

export default SearchBar;
