// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import { collection, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';

/**
 * Migration utility to recalculate and update category totals from existing entries.
 * This is needed when migrating from the old system to TanStack Query where
 * category totals might not have been properly maintained.
 */
export async function migrateCategoryTotals(db, userId, month) {
  console.log(`Starting migration for user ${userId}, month ${month}`);
  
  try {
    // Get all categories first, then get entries from each category's subcollection
    const categoriesPath = `manualBudget/${userId}/months/${month}/categories`;
    const categoriesRef = collection(db, categoriesPath);
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    console.log(`Found ${categoriesSnapshot.docs.length} categories to process`);
    
    // Calculate totals by category from all entries in each category
    const categoryTotals = {};
    let totalSpent = 0;
    let totalEntriesProcessed = 0;
    
    // Process each category and its entries
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryName = categoryDoc.id;
      
      // Get entries for this category
      const entriesPath = `manualBudget/${userId}/months/${month}/categories/${categoryName}/entries`;
      const entriesRef = collection(db, entriesPath);
      const entriesSnapshot = await getDocs(entriesRef);
      
      let categoryTotal = 0;
      
      entriesSnapshot.docs.forEach(entryDoc => {
        const entryData = entryDoc.data();
        
        if (entryData.amount) {
          const amount = Number(entryData.amount) || 0;
          categoryTotal += amount;
          totalSpent += amount;
          totalEntriesProcessed++;
        }
      });
      
      categoryTotals[categoryName] = categoryTotal;
      console.log(`Category ${categoryName}: ${categoryTotal} (from ${entriesSnapshot.docs.length} entries)`);
    }
    
    console.log('Calculated category totals:', categoryTotals);
    console.log('Total spent:', totalSpent);
    
    // Update each category with its calculated total (we already have the categories)
    const updatePromises = [];
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryName = categoryDoc.id;
      const calculatedTotal = categoryTotals[categoryName] || 0;
      
      console.log(`Updating category ${categoryName} total to ${calculatedTotal}`);
      
      const updatePromise = updateDoc(categoryDoc.ref, { 
        total: calculatedTotal,
        updatedAt: new Date()
      });
      
      updatePromises.push(updatePromise);
    }
    
    // Execute all category updates
    await Promise.all(updatePromises);
    
    // Update month total if month document exists
    try {
      const monthDocRef = doc(db, `manualBudget/${userId}/months/${month}`);
      const monthDoc = await getDoc(monthDocRef);
      if (monthDoc.exists()) {
        await updateDoc(monthDocRef, { 
          total: totalSpent,
          updatedAt: new Date()
        });
        console.log(`Updated month total to ${totalSpent}`);
      }
    } catch (monthError) {
      console.warn('Could not update month total:', monthError);
    }
    
    console.log(`Migration completed successfully. Total spent: ${totalSpent}`);
    
    return {
      success: true,
      totalSpent,
      categoryTotals,
      entriesProcessed: totalEntriesProcessed,
      categoriesUpdated: categoriesSnapshot.docs.length
    };
    
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
