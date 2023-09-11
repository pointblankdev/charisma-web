import React, { useEffect, useState } from 'react';
import { SkipNavContent } from '@reach/skip-nav';
import Image from 'next/image';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';

import searchIcon from '../components/icons/leaderboard/search.png';
import clipboardIcon from '../components/icons/leaderboard/clipboard.png';
import linkIcon from '../components/icons/leaderboard/Goto.png';

import goldMedal from '../components/icons/leaderboard/first-medal.png';
import silverMedal from '../components/icons/leaderboard/second-medal.png';
import bronzeMedal from '../components/icons/leaderboard/third-medal.png';

// SearchBar component
const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    onSearch(searchText);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for an address"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{
          borderRadius: '5px',
          borderColor: '#780000',
          backgroundColor: 'transparent',
          padding: '5px',
          paddingLeft: '30px', // Add left padding for the icon
          background: `url(${searchIcon}) 5px center no-repeat`, // Add the search icon as a background image
          backgroundSize: '20px 20px' // Set the size of the background image
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          borderColor: '#780000',
          backgroundColor: 'transparent',
          position: 'absolute',
          top: '5px', // Adjust the vertical position as needed
          left: '5px' // Adjust the horizontal position as needed
        }}
      >
        {/* You can use an empty span to create space for the icon */}
        <span style={{ width: '20px', height: '20px', display: 'block' }}></span>
      </button>
    </div>
  );
};

// FilterBar component
const FilterBar = ({ activeFilter, onFilterChange }) => {
  const filters = ['7 days', '30 days', 'All-time'];

  return (
    <div className="filter-bar">
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={activeFilter === filter ? 'active' : ''}
          style={{
            borderRadius: '5px',
            borderColor: '#780000',
            backgroundColor: activeFilter === filter ? '#323332' : 'black',
            color: activeFilter === filter ? 'white' : 'white'
          }}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

// Leaderboard component
export default function Leaderboard() {
  const meta = {
    title: 'Charisma | Leaderboard',
    description: META_DESCRIPTION
  };
  const [data, setData] = useState([]); // Store your data here
  const [searchedText, setSearchedText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All-time');

  // Simulated API call to fetch data
  useEffect(() => {
    // Replace this with your actual API call logic
    const fetchData = async () => {
      try {
        const response = await fetch('https://');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = text => {
    setSearchedText(text);
  };

  const handleFilterChange = filter => {
    setActiveFilter(filter);
  };

  // Sort the data by Power Score in descending order
  const sortedData = [...data].sort((a, b) => b.powerScore - a.powerScore);

  // Filter and search data here based on 'searchedText' and 'activeFilter'
  const filteredData = sortedData.filter(entry =>
    entry.address.toLowerCase().includes(searchedText.toLowerCase())
  );

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div id="lead">
          <div className="flex justify-between items-end">
            <SearchBar onSearch={handleSearch} />
            <FilterBar activeFilter={activeFilter} onFilterChange={handleFilterChange} />
          </div>
          <div className="leaderboard">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Power Score</th>
                  <th>Quests Completed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry, index) => (
                  <tr key={index}>
                    <td>
                      {index < 3 ? (
                        // Display medal images for the first three ranks
                        <img
                          src={index === 0 ? goldMedal : index === 1 ? silverMedal : bronzeMedal}
                          alt={`Rank ${index + 1}`}
                          style={{ width: '50px', height: '50px' }}
                        />
                      ) : (
                        // Display rank number for other ranks
                        index + 1
                      )}
                    </td>
                    <td>
                      <div className="name-wrapper">
                        <img src={entry.image} alt="Avatar" />
                        <span>{entry.address}</span>
                        <button
                          onClick={() => {
                            // Handle copy address logic here
                            const textarea = document.createElement('textarea');
                            textarea.value = entry.address;
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textarea);
                          }}
                          className="copy-icon"
                        >
                          <Image src={clipboardIcon} alt="Copy" width={20} height={20} />
                        </button>
                      </div>
                    </td>
                    <td>{entry.powerScore}</td>
                    <td>{entry.questsCompleted}</td>
                    <td>
                      <a href={entry.link}>
                        <Image src={linkIcon} alt="Link" width={20} height={20} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </Page>
  );
}
