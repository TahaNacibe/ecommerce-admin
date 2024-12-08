"use client"
import { useSession } from "next-auth/react";
import SideBar from "../pages/components/sideBar";
import UnauthenticatedPage from "../unauthorized/page";
import { useEffect, useState } from "react";
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

interface AdminOrdersTableProps {
    orders: Order[];
}

export default function OrderMainPage() {
    const [ordersData, setOrdersData] = useState<Order[]>([])

    useEffect(() => {
        const getOrdersForTheAdmin = async () => {
            const response = await axios.get("/api/orders")
            setOrdersData(response.data.orders)
            console.log("orders", response.data.orders)
        }

        getOrdersForTheAdmin()
    }, [])
    const session = useSession()
    if (session.status === "loading") {
        return
    }
    if (session.status === "unauthenticated") {
        return (<UnauthenticatedPage />)
    }
    return (
        <div className="bg-white w-screen text-black flex flex-row h-screen">
            {/* side bar */}
            <SideBar />
            {/* page ui - wrapper with fixed height and scroll */}
            <div className="flex-1 overflow-hidden">
                {ordersData && ordersData.length > 0 ? <AdminOrdersTable orders={ordersData} /> : <div>No orders found</div>}
            </div>
        </div>
    )
}

const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({ orders }) => {
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number, currency: string): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount / 100);
    };

    const getTotalAmount = (lineItems: LineItem[]): string => {
        if (!lineItems?.[0]) return formatCurrency(0, 'USD');
        const total = lineItems.reduce((sum, item) =>
            sum + (item.price_data.unit_amount * item.quantity), 0
        );
        return formatCurrency(total, lineItems[0].price_data.currency);
    };

    return (
        <div className="h-screen overflow-hidden flex flex-col p-4">
            <h2 className="text-2xl font-bold p-4">Orders Management</h2>
            <div className="overflow-auto flex-1">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order Date
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Items Details
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Shipping Details
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sender
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders?.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {getTotalAmount(order.line_items)}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{order.name}</div>
                                    <div className="text-sm text-gray-500">{order.email}</div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{order.phoneNumber}</div>
                                </td>
                                <td className="px-3 py-4">
                                    <div className="text-sm text-gray-900">
                                        {order.line_items.map((item, index) => (
                                            <div key={index} className="mb-1">
                                                <span className="font-medium">{item.price_data.product_data.name}</span>
                                                <span className="text-gray-500"> x {item.quantity}</span>
                                                <div className="text-gray-500 text-xs">
                                                    {formatCurrency(item.price_data.unit_amount, item.price_data.currency)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-3 py-4">
                                    <div className="text-sm text-gray-900">
                                        {order.address}
                                        <br />
                                        {order.city}, {order.country}
                                        <br />
                                        {order.postalCode}
                                    </div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.senderEmail}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};