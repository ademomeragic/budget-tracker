using BudgetTracker.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

public class Transaction
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;

    // NEW FIELDS
    public int WalletId { get; set; }
    public Wallet Wallet { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

}

