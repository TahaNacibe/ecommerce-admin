"use client"
import { useSession } from "next-auth/react";
import SideBar from "../pages/components/sideBar";
import UnauthenticatedPage from "../unauthorized/page";
import { useEffect, useState } from "react";
import { Package, Banknote,ClockArrowUp,User } from "lucide-react";
import axios from "axios";

interface LineItem {
    price_data: {
        currency: string;
        unit_amount: number;
        product_data: {
            name: string;
        };
    };
    quantity: number;
}

interface Order {
    _id: string;
    line_items: LineItem[];
    name: string;
    email: string;
    country: string;
    city: string;
    address: string;
    phoneNumber: string;
    postalCode: string;
    senderEmail: string;
    isPaid: boolean;
    createdAt: string;
}

export default function DashboardPage() {
    const [ordersData, setOrdersData] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getOrdersForTheAdmin = async () => {
            try {
                const response = await axios.get("/api/orders");
                setOrdersData(response.data.orders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getOrdersForTheAdmin();
    }, []);

    const session = useSession();
    if (session.status === "loading") {
        return null;
    }
    if (session.status === "unauthenticated") {
        return (<UnauthenticatedPage />);
    }

    return (
        <div className="bg-gray-100 w-screen min-h-screen flex flex-row">
            <SideBar />
            <div className="flex-1 overflow-hidden">
            <DashboardContent orders={ordersData} isLoading={isLoading}/>
            </div>
        </div>
    );
}

interface DashboardContentProps {
    orders: Order[];
    isLoading: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ orders, isLoading }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount / 100);
    };

    const calculateMetrics = () => {
        const totalOrders = orders.length;
        const paidOrders = orders.filter(order => order.isPaid).length;
        const pendingOrders = totalOrders - paidOrders;
        
        const totalRevenue = orders.reduce((total, order) => {
            const orderTotal = order.line_items.reduce((sum, item) => 
                sum + (item.price_data.unit_amount * item.quantity), 0
            );
            return total + orderTotal;
        }, 0);

        const uniqueCustomers = new Set(orders.map(order => order.email)).size;

        return {
            totalOrders,
            paidOrders,
            pendingOrders,
            totalRevenue,
            uniqueCustomers
        };
    };

    const metrics = calculateMetrics();

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-8">
                <div className="text-xl">Loading dashboard data...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-screen overflow-auto text-black">
            <div className="mb-8">
                <div className="bg-white py-2 px-4 pt-8">
                <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
                </div>
                <div className="p-8">

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-500 mb-2">Total Orders</div>
                        <div className="text-2xl font-bold flex gap-2 items-center"> <Package /> {metrics.totalOrders}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-500 mb-2">Total Revenue</div>
                        <div className="text-2xl font-bold text-green-600 flex gap-2 items-center">
                        <Banknote />
                            {formatCurrency(metrics.totalRevenue)}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-500 mb-2">Pending Orders</div>
                        <div className="text-2xl font-bold text-orange-500 flex gap-2 items-center">
                        <ClockArrowUp />
                            {metrics.pendingOrders}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-500 mb-2">Unique Customers</div>
                        <div className="text-2xl font-bold text-blue-600 flex gap-2 items-center">
                        <User />
                            {metrics.uniqueCustomers}</div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.slice(0, 5).map((order) => {
                                    const totalAmount = order.line_items.reduce(
                                        (sum, item) => sum + (item.price_data.unit_amount * item.quantity),
                                        0
                                    );

                                    return (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{order.name}</div>
                                                <div className="text-sm text-gray-500">{order.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(totalAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    order.isPaid 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {order.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};