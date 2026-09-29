const express = require('express');

const app = express();
app.use(express.json());

const products = [
    {
        id: 1,
        name: 'Test 1',
        category: 'Category 1',
        description: 'Description of Product 1',
    },
    {
        id: 2,
        name: 'Test 2',
        category: 'Category 2',
        description: 'Description of Product 2',
    },
    {
        id: 3,
        name: 'Test 3',
        category: 'Category 3',
        description: 'Description of Product 3',
    },
    {
        id: 4,
        name: 'Test 4',
        category: 'Category 4',
        description: 'Description of Product 4',
    },
    {
        id: 5,
        name: 'Test 5',
        category: 'Category 5',
        description: 'Description of Product 5',
    },
];

// Lister tous les produits
app.get('/products', (req, res) => {
    res.json(products);
});

// Consulter un produit par son id
app.get('/products/:id', (req, res) => {
    const product = products.find((p) => p.id === Number(req.params.id));

    if (!product) {
        return res.status(404).json({ message: 'Produit introuvable' });
    }

    res.json(product);
});

// Ajouter un produit
app.post('/products', (req, res) => {
    const { name, category, description } = req.body;

    if (!name || !category || !description) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        name,
        category,
        description,
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Remplacer complètement un produit (PUT)
app.put('/products/:id', (req, res) => {
    const productIndex = products.findIndex((p) => p.id === Number(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produit introuvable' });
    }

    const { name, category, description } = req.body;

    if (!name || !category || !description) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    products[productIndex] = {
        id: Number(req.params.id),
        name,
        category,
        description,
    };

    res.json(products[productIndex]);
});

// Modifier partiellement un produit (PATCH)
app.patch('/products/:id', (req, res) => {
    const productIndex = products.findIndex((p) => p.id === Number(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produit introuvable' });
    }

    products[productIndex] = {
        ...products[productIndex],
        ...req.body,
    };

    res.json(products[productIndex]);
});

// Supprimer un produit
app.delete('/products/:id', (req, res) => {
    const productIndex = products.findIndex((p) => p.id === Number(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produit introuvable' });
    }

    const [deletedProduct] = products.splice(productIndex, 1);
    res.json({ message: 'Produit supprimé', product: deletedProduct });
});

app.listen(3000, () => {
    console.log('Serveur lancé sur le port 3000');
}); 