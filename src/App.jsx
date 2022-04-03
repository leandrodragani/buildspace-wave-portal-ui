import React from 'react';
import { ethers } from 'ethers';
import WavePortalABI from './utils/WavePortal.json';
import { formatDistance } from 'date-fns';

const contractAddress = '0xb99aC7b8022D3292052202cF08968f10B8869C29';

const contractABI = WavePortalABI.abi;

export default function App() {
	const [currentAccount, setCurrentAccount] = React.useState('');
	const [waveCount, setWaveCount] = React.useState(0);
	const [allWaves, setAllWaves] = React.useState([]);
	const [message, setMessage] = React.useState('');

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Make sure you have metamask!');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			/*
      * Check if we're authorized to access the user's wallet
      */
			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);
				fetchWaveCount();
				fetchAllWaves();
			} else {
				console.log('No authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
	};

	React.useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	React.useEffect(() => {
		let wavePortalContract;

		const onNewWave = (from, timestamp, message) => {
			console.log('NewWave', from, timestamp, message);
			setAllWaves(prevState => [
				...prevState,
				{
					address: from,
					timestamp: new Date(timestamp * 1000),
					message: message
				}
			]);
		};

		if (window.ethereum) {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();

			wavePortalContract = new ethers.Contract(
				contractAddress,
				contractABI,
				signer
			);
			wavePortalContract.on('NewWave', onNewWave);
		}

		return () => {
			if (wavePortalContract) {
				wavePortalContract.off('NewWave', onNewWave);
			}
		};
	}, []);

	const fetchWaveCount = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();
				setWaveCount(count.toNumber());
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const fetchAllWaves = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let waves = await wavePortalContract.getAllWaves();
				/*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
				let wavesCleaned = [];
				waves.forEach(wave => {
					wavesCleaned.push({
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message
					});
				});

				/*
         * Store our data in React State
         */
				setAllWaves(wavesCleaned);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const wave = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();

				console.log('Retrieved total wave count...', count.toNumber());

				/*
        * Execute the actual wave from your smart contract
        */
				const waveTxn = await wavePortalContract.wave(message, {
					gasLimit: 300000
				});
				console.log('Mining...', waveTxn.hash);

				await waveTxn.wait();
				console.log('Mined -- ', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());

				setWaveCount(count.toNumber());

				
				setMessage('');
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="bg-white">
			<div className="relative sm:py-16">
				<div aria-hidden="true" className="hidden sm:block">
					<div className="absolute inset-y-0 left-0 w-1/2 bg-gray-50 rounded-r-3xl" />
					<svg
						className="absolute top-8 left-1/2 -ml-3"
						width={404}
						height={392}
						fill="none"
						viewBox="0 0 404 392"
					>
						<defs>
							<pattern
								id="8228f071-bcee-4ec8-905a-2a059a2cc4fb"
								x={0}
								y={0}
								width={20}
								height={20}
								patternUnits="userSpaceOnUse"
							>
								<rect
									x={0}
									y={0}
									width={4}
									height={4}
									className="text-gray-200"
									fill="currentColor"
								/>
							</pattern>
						</defs>
						<rect
							width={404}
							height={392}
							fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)"
						/>
					</svg>
				</div>
				<div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
					<div className="relative rounded-2xl px-6 py-10 bg-indigo-600 overflow-hidden shadow-xl sm:px-12 sm:py-20">
						<div
							aria-hidden="true"
							className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0"
						>
							<svg
								className="absolute inset-0 h-full w-full"
								preserveAspectRatio="xMidYMid slice"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 1463 360"
							>
								<path
									className="text-indigo-500 text-opacity-40"
									fill="currentColor"
									d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z"
								/>
								<path
									className="text-indigo-700 text-opacity-40"
									fill="currentColor"
									d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z"
								/>
							</svg>
						</div>
						<div className="relative">
							<div className="sm:text-center">
								<h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
									👋 Hey there! I am Leandro
								</h2>
								<p className="mt-6 mx-auto max-w-2xl text-lg text-indigo-200">
									Greetings from Argentina! Connect your Ethereum wallet and
									wave at me!
								</p>
								<p className="mt-6 mx-auto max-w-2xl text-lg text-indigo-200">
									So far I've received {waveCount} waves.
								</p>
							</div>
							<div className="mt-12 sm:mx-auto sm:max-w-lg sm:flex">
								<div className="min-w-0 flex-1">
									<label htmlFor="cta-email" className="sr-only">
										Email address
									</label>
									<input
										id="cta-email"
										type="text"
										className="block w-full border border-transparent rounded-md px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
										placeholder="Enter your message..."
										onChange={e => setMessage(e.target.value)}
									/>
								</div>
								<div className="mt-4 sm:mt-0 sm:ml-3">
									<button
										type="submit"
										className="block w-full rounded-md border border-transparent px-5 py-3 bg-indigo-500 text-base font-medium text-white shadow hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:px-10 disabled:opacity-50"
										disabled={!message}
										onClick={wave}
									>
										Wave me
									</button>
								</div>
							</div>
							{!currentAccount && (
								<button
									className="block w-full rounded-md border border-transparent px-5 py-3 bg-white text-base font-medium text-black shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:px-10 mt-4"
									onClick={connectWallet}
								>
									Connect Wallet
								</button>
							)}
							<div className="mt-10">
								<ul role="list" className="divide-y divide-gray-200">
									{allWaves
										.sort((a, b) => b.timestamp - a.timestamp)
										.map((wave, index) => {
											return (
												<li key={index} className="py-4">
													<div className="flex space-x-3">
														<img
															className="h-6 w-6 rounded-full"
															src="https://i.pravatar.cc/300"
															alt=""
														/>
														<div className="flex-1 space-y-1">
															<div className="flex items-center justify-between">
																<h3 className="text-sm font-medium text-white">
																	{wave.address}
																</h3>
																<p className="text-sm text-gray-100">
																	{formatDistance(wave.timestamp, new Date(), {
																		addSuffix: true
																	})}
																</p>
															</div>
															<p className="text-sm text-gray-100">
																{wave.message}
															</p>
														</div>
													</div>
												</li>
											);
										})}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
