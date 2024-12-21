import React, { useState, useEffect } from 'react';
import { PlayCircle } from 'lucide-react';

const media = [
    {
      type: "image",
      id: 1,
      title: "Grilled Salmon",
      category: "Fine Dining",
      description: "Fresh Atlantic salmon with herbs",
      src: "https://plus.unsplash.com/premium_photo-1673590981774-d9f534e0c617?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      type: "video",
      id: 2,
      title: "Chef's Special",
      category: "Kitchen",
      description: "Watch our chef in action",
      src: "https://videos.pexels.com/video-files/2882090/2882090-uhd_2560_1440_24fps.mp4",
      thumbnail: "/api/placeholder/400/300"
    },
    {
        type: "image",
        id: 3,
        title: "Our Interior Design",
        category: "Interior",
        description: "Watch our chef in action",
        src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        thumbnail: "/api/placeholder/400/300"
      },
    {
        type: "video",
        id: 4,
        title: "Drink Amazing Tea",
        category: "Beverages",
        description: "Fresh Atlantic salmon with herbs",
        src: "https://videos.pexels.com/video-files/9046240/9046240-uhd_1440_2560_24fps.mp4"
      },
    {
        type: "video",
        id: 5,
        title: "Event's You won't miss",
        category: "Events",
        description: "Watch our chef in action",
        src: "https://videos.pexels.com/video-files/3195971/3195971-uhd_2560_1440_25fps.mp4",
        thumbnail: "/api/placeholder/400/300"
      },
];

const RestaurantGallery = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [displayedMedia, setDisplayedMedia] = useState(media);
    
    const categories = ['All', 'Fine Dining', 'Kitchen', 'Interior', 'Beverages', 'Events'];

    useEffect(() => {
        const filtered = activeCategory === 'All'
            ? media
            : media.filter(item => item.category === activeCategory);
        setDisplayedMedia(filtered);
    }, [activeCategory]);

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h1 className="gallery-title">Culinary Excellence</h1>
                <p className="gallery-subtitle">Experience the artistry of fine dining</p>
            </div>

            <div className="category-filters">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`category-button ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="media-grid">
                {displayedMedia.map((item) => (
                    <div key={item.id} className="media-card">
                        <div className="media-image-container">
                            {item.type === "video" ? (
                                <>
                                    <video
                                        className="media-video"
                                        src={item.src}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                    <div className="media-overlay">
                                        <h3 className="media-title">{item.title}</h3>
                                        <p className="media-description">{item.description}</p>
                                        <span className="media-category">{item.category}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <img
                                        src={item.src}
                                        alt={item.title}
                                        className="media-image"
                                    />
                                    <div className="media-overlay">
                                        <h3 className="media-title">{item.title}</h3>
                                        <p className="media-description">{item.description}</p>
                                        <span className="media-category">{item.category}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                /* All the previous CSS styles remain the same */
                .gallery-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                    padding: 4rem 2rem;
                    color: #ffffff;
                }

                .gallery-header {
                    text-align: center;
                    margin-bottom: 3rem;
                    animation: fadeInDown 1s forwards;
                }

                .gallery-title {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    background: linear-gradient(to right, #f5d742, #f5a742);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: bold;
                    letter-spacing: 2px;
                }

                .gallery-subtitle {
                    font-size: 1.5rem;
                    color: #cccccc;
                    font-weight: 300;
                }

                .category-filters {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 3rem;
                    flex-wrap: wrap;
                }

                .category-button {
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 30px;
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 1rem;
                }

                .category-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .category-button.active {
                    background: #f5d742;
                    color: #1a1a1a;
                    box-shadow: 0 4px 20px rgba(245, 215, 66, 0.3);
                }

                .media-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .media-card {
                    position: relative;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .media-image-container {
                    position: relative;
                    padding-bottom: 75%;
                    overflow: hidden;
                }

                .media-image, .media-video {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.7s ease;
                }

                .media-card:hover .media-image,
                .media-card:hover .media-video {
                    transform: scale(1.1);
                }

                .media-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 2rem;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
                    transform: translateY(100px);
                    transition: transform 0.5s ease;
                }

                .media-card:hover .media-overlay {
                    transform: translateY(0);
                }

                .media-title {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                }

                .media-description {
                    color: #cccccc;
                    margin-bottom: 1rem;
                    font-size: 1rem;
                }

                .media-category {
                    display: inline-block;
                    padding: 0.4rem 1rem;
                    background: rgba(245, 215, 66, 0.9);
                    color: #1a1a1a;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .gallery-title {
                        font-size: 3rem;
                    }
                    
                    .gallery-subtitle {
                        font-size: 1.2rem;
                    }
                    
                    .media-grid {
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1rem;
                    }
                    
                    .category-filters {
                        gap: 0.5rem;
                    }
                    
                    .category-button {
                        padding: 0.6rem 1.2rem;
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default RestaurantGallery;