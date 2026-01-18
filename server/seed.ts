import db from './database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
    console.log('🌱 Seeding database...');

    // Seed products
    const products = [
        {
            id: 'tool-set-1',
            name: '定制工具套装',
            description: '专为工友打造的专业级维修工具套装。包含52件常用工具，满足日常维修需求。',
            price: 299,
            originalPrice: 399,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0tgVAtLCvwh3HGnPSKJImNJDmFBzznwpkDWJVyu28SZpj-ij8YzCxJNAehmauIn16xHc29sNBXvqZGb_bTvna5iRVrDGs5nKAS5ogdp2wj8A2KlykDDaWxjLNuDJzdtB8mlYQhPgWg_SvcGzzZDTnBd-nUmpymprcNXfBP5phS79DQMxFwTwoKZPQa_Q2hWkdBv2eKv5UajTaUb0Ax0UZ1MSx5lJNLTea-GsWmF5qLVFVykHOJH3DisAG0TaLo67J6YWMoxwwqyme',
            badge: '热销榜 TOP1',
            specs: JSON.stringify(['标准套装 (52件套)']),
            features: JSON.stringify(['高强度钢材', '防滑手柄', '便携工具箱']),
            detail_images: JSON.stringify([])
        }
    ];

    const productStmt = db.prepare(`
    INSERT OR IGNORE INTO products (id, name, description, price, original_price, image, badge, specs, features, detail_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    for (const product of products) {
        productStmt.run(
            product.id,
            product.name,
            product.description,
            product.price,
            product.originalPrice,
            product.image,
            product.badge,
            product.specs,
            product.features,
            product.detail_images
        );
    }

    console.log('✅ Database seeded successfully!');
}

seedDatabase().catch(console.error);
