import Link from 'next/link';
import { MapPin, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Find Halal Restaurants
                        <br />
                        <span className="text-primary">Near You</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Discover certified halal dining options in Philadelphia. Search, explore, and enjoy authentic halal cuisine with confidence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/restaurants">
                            <Button size="lg" className="text-lg px-8">
                                Get Started
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button variant="outline" size="lg" className="text-lg px-8">
                                Sign Up Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Why Choose HalalSpot?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center p-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                <MapPin className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Find Nearby</h3>
                            <p className="text-gray-600">
                                Discover halal restaurants in your area with our interactive map and location-based search.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center p-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                                <CheckCircle className="w-8 h-8 text-secondary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Verified Halal</h3>
                            <p className="text-gray-600">
                                All restaurants are verified for halal certification, Muslim ownership, or halal options.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center p-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                                <Star className="w-8 h-8 text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Community Reviews</h3>
                            <p className="text-gray-600">
                                Read authentic reviews from the community to make informed dining decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Explore?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of users discovering amazing halal restaurants in Philadelphia.
                    </p>
                    <Link href="/restaurants">
                        <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100 border-white text-lg px-8">
                            Browse Restaurants
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}
