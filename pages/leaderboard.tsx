import React, { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Button } from '@components/ui/button';
import Link from 'next/link';
import { fetchAllContractTransactions, getProposals, updateVoteData } from '@lib/stacks-api';
import dmlogo from '@public/dm-logo.png';


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
          padding: '5px'
        }}
      />
      <button onClick={handleSearch} style={{ borderColor: '#780000', backgroundColor: 'transparent' }}>
        <i className="fas fa-search" style={{ color: '#780000' }}></i>
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
            backgroundColor: activeFilter === filter ? 'rgb(65, 62, 62)' : 'black',
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

  // Filter and search data here based on 'searchedText' and 'activeFilter'
  const filteredData = data.filter(entry =>
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
                  <td>{entry.num}</td>
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
                        Copy
                      </button>
                    </div>
                  </td>
                  <td>{entry.powerScore}</td>
                  <td>{entry.questsCompleted}</td>
                  <td>
                    <a href={entry.link}>
                      <i className="fas fa-external-link-alt"></i>
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
